-- ====================================================================
-- SISTEMA B10 GESTÃO SAAS - ESTRUTURA FINAL COM CONTROLE DE ESTOQUE
-- ====================================================================

-- 1. CRIAÇÃO/CORREÇÃO DE TABELAS
CREATE TABLE IF NOT EXISTS restaurantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status_assinatura VARCHAR(50) DEFAULT 'teste',
    cor_primaria VARCHAR(7) DEFAULT '#dc2626',
    logo_url TEXT,
    email_contato VARCHAR(255),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios_restaurante (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    restaurante_id INTEGER REFERENCES restaurantes(id) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    CONSTRAINT user_rest_unique UNIQUE (user_id, restaurante_id)
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id),
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    estoque_atual INTEGER DEFAULT 0,
    imagem_url TEXT
);

CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id),
    nome VARCHAR(255) NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 0,
    unidade_medida VARCHAR(20) DEFAULT 'kg',
    custo_unitario DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comandas (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id),
    mesa VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'aberta',
    total DECIMAL(10,2) DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id),
    comanda_id INTEGER REFERENCES comandas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FUNÇÕES DE SUPORTE E SEGURANÇA
CREATE OR REPLACE FUNCTION get_user_restaurante_id()
RETURNS INTEGER AS $$
    SELECT restaurante_id FROM usuarios_restaurante WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_restaurante_id_for_new_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.restaurante_id = get_user_restaurante_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. LÓGICA DE ESTOQUE AUTOMÁTICO (ABATE E ESTORNO)
CREATE OR REPLACE FUNCTION handle_order_item_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Abate o estoque ao vender
        UPDATE produtos 
        SET estoque_atual = estoque_atual - NEW.quantidade 
        WHERE id = NEW.produto_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Retorna ao estoque se o item for deletado do pedido
        UPDATE produtos 
        SET estoque_atual = estoque_atual + OLD.quantidade 
        WHERE id = OLD.produto_id;
        
        -- Atualiza o total da comanda subtraindo o valor do item removido
        UPDATE comandas 
        SET total = total - (OLD.quantidade * OLD.preco_unitario) 
        WHERE id = OLD.comanda_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. APLICAÇÃO DE TRIGGERS
DROP TRIGGER IF EXISTS tr_order_item_stock ON itens_pedido;
CREATE TRIGGER tr_order_item_stock
AFTER INSERT OR DELETE ON itens_pedido
FOR EACH ROW EXECUTE FUNCTION handle_order_item_stock();

-- 5. ATIVAR RLS E SEGURANÇA
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('produtos', 'insumos', 'comandas', 'itens_pedido')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Acesso SaaS" ON %I', t);
        EXECUTE format('CREATE POLICY "Acesso SaaS" ON %I FOR ALL USING (restaurante_id = get_user_restaurante_id()) WITH CHECK (restaurante_id = get_user_restaurante_id())', t);
    END LOOP;
END $$;

-- 6. RPC PARA INCREMENTAR TOTAL (USADO NO FRONTEND)
CREATE OR REPLACE FUNCTION increment_comanda_total(cid INTEGER, amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE comandas SET total = total + amount WHERE id = cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SEED DE PRODUTOS INICIAIS COM ESTOQUE
CREATE OR REPLACE FUNCTION seed_new_restaurant_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO produtos (restaurante_id, nome, preco, categoria, estoque_atual) 
    VALUES 
        (NEW.id, 'Picanha na Brasa', 89.90, 'Carnes', 20),
        (NEW.id, 'Cerveja Artesanal 600ml', 18.00, 'Bebidas', 50),
        (NEW.id, 'Coca-Cola 350ml', 6.50, 'Bebidas', 100),
        (NEW.id, 'Buffet Livre (Almoço)', 35.00, 'Refeições', 999);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_seed_after_restaurant ON restaurantes;
CREATE TRIGGER tr_seed_after_restaurant
AFTER INSERT ON restaurantes
FOR EACH ROW EXECUTE FUNCTION seed_new_restaurant_data();
