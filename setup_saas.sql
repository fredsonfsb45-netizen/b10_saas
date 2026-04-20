-- ====================================================================
-- ARQUITETURA MULTI-INQUILINO (SAAS) DO B10 - FINALIZADA
-- ====================================================================

-- 1. Tabelas Base (já criadas anteriormente, aqui apenas para referência)
CREATE TABLE IF NOT EXISTS restaurantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status_assinatura VARCHAR(50) DEFAULT 'ativo',
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

-- 2. Garantir colunas de controle (SaaS)
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS restaurante_id INTEGER REFERENCES restaurantes(id) DEFAULT 1;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS restaurante_id INTEGER REFERENCES restaurantes(id) DEFAULT 1;
ALTER TABLE itens_pedido ADD COLUMN IF NOT EXISTS restaurante_id INTEGER REFERENCES restaurantes(id) DEFAULT 1;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS restaurante_id INTEGER REFERENCES restaurantes(id) DEFAULT 1;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS restaurante_id INTEGER REFERENCES restaurantes(id) DEFAULT 1;

-- 3. Função Auxiliar para Segurança (Retorna o Restaurante ID do usuário logado)
CREATE OR REPLACE FUNCTION get_user_restaurante_id()
RETURNS INTEGER AS $$
    SELECT restaurante_id FROM usuarios_restaurante WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Ativar RLS (Cadeados)
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA (O Coração do SaaS)

-- Restaurantes: Usuário vê apenas o seu restaurante
CREATE POLICY "Usuário vê apenas seu restaurante" ON restaurantes
    FOR SELECT USING (id = get_user_restaurante_id());

CREATE POLICY "Qualquer autenticado cria restaurante" ON restaurantes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios Restaurante: Usuário vê seu próprio vínculo
CREATE POLICY "Usuário vê seu próprio vínculo" ON usuarios_restaurante
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Qualquer autenticado cria seu vínculo" ON usuarios_restaurante
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabelas de Dados: Filtro por restaurante_id em todas as operações
-- (Repetir para todas as tabelas)

DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('produtos', 'comandas', 'itens_pedido', 'despesas', 'configuracoes')
    LOOP
        EXECUTE format('CREATE POLICY "Acesso por restaurante" ON %I USING (restaurante_id = get_user_restaurante_id())', t);
    END LOOP;
END $$;

-- 6. Trigger para preenchimento automático do restaurante_id em novos registros
-- Isso garante que mesmo que o frontend esqueça, o banco de dados atribui ao dono correto.
CREATE OR REPLACE FUNCTION set_restaurante_id_for_new_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.restaurante_id = get_user_restaurante_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('produtos', 'comandas', 'itens_pedido', 'despesas', 'configuracoes')
    LOOP
        EXECUTE format('CREATE TRIGGER tr_set_restaurante_id BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION set_restaurante_id_for_new_row()', t);
    END LOOP;
END $$;
