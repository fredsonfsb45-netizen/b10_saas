-- ====================================================================
-- MIGRAÇÃO V1: AUDITORIA, CUSTOS E FICHA TÉCNICA
-- ====================================================================

-- 1. Adicionar auditoria de usuário no histórico
ALTER TABLE IF EXISTS historico_estoque 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Adicionar campo de custo nos produtos
ALTER TABLE IF EXISTS produtos 
ADD COLUMN IF NOT EXISTS custo DECIMAL(10,2) DEFAULT 0;

-- 3. Criar tabela de Ficha Técnica
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id) NOT NULL,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE NOT NULL,
    insumo_id INTEGER REFERENCES insumos(id) ON DELETE CASCADE NOT NULL,
    quantidade_necessaria DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_prod_insumo UNIQUE (produto_id, insumo_id)
);

-- Ativar RLS para Ficha Técnica
ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso SaaS Fichas" ON fichas_tecnicas;
CREATE POLICY "Acesso SaaS Fichas" ON fichas_tecnicas FOR ALL 
USING (restaurante_id = get_user_restaurante_id()) 
WITH CHECK (restaurante_id = get_user_restaurante_id());

-- Gatilho para restaurante_id automático
DROP TRIGGER IF EXISTS tr_set_restaurante_id_fichas ON fichas_tecnicas;
CREATE TRIGGER tr_set_restaurante_id_fichas
BEFORE INSERT ON fichas_tecnicas
FOR EACH ROW EXECUTE FUNCTION set_restaurante_id_for_new_row();

-- 4. Atualizar o Trigger de Estoque para considerar Insumos
CREATE OR REPLACE FUNCTION handle_order_item_stock()
RETURNS TRIGGER AS $$
DECLARE
    ficha_rec RECORD;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- A. Baixa automática do Produto
        UPDATE produtos 
        SET estoque_atual = estoque_atual - NEW.quantidade 
        WHERE id = NEW.produto_id;

        -- B. Baixa automática dos Insumos (Ficha Técnica)
        FOR ficha_rec IN SELECT insumo_id, quantidade_necessaria FROM fichas_tecnicas WHERE produto_id = NEW.produto_id LOOP
            UPDATE insumos 
            SET quantidade = quantidade - (ficha_rec.quantidade_necessaria * NEW.quantidade)
            WHERE id = ficha_rec.insumo_id;
        END LOOP;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        -- A. Estorno do Produto
        UPDATE produtos 
        SET estoque_atual = estoque_atual + OLD.quantidade 
        WHERE id = OLD.produto_id;

        -- B. Estorno dos Insumos (Ficha Técnica)
        FOR ficha_rec IN SELECT insumo_id, quantidade_necessaria FROM fichas_tecnicas WHERE produto_id = OLD.produto_id LOOP
            UPDATE insumos 
            SET quantidade = quantidade + (ficha_rec.quantidade_necessaria * OLD.quantidade)
            WHERE id = ficha_rec.insumo_id;
        END LOOP;
        
        -- C. Atualização do Total da Comanda
        UPDATE comandas 
        SET total = total - (OLD.quantidade * OLD.preco_unitario) 
        WHERE id = OLD.comanda_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
