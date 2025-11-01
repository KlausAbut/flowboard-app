-- Création d'une table users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    -- mot de passe haché (bcrypt) - peut être NULL pour les utilisateurs de test
    password TEXT
);

-- Quelques données de test
INSERT INTO users (email, name, password)
VALUES 
 ('alice@example.com', 'Alice', '$2a$10$nb4k/em5RGv4fKVW5BoJF.uQsF7qx8tBPDQn62JESXqWgBGtRiRiG'),
 ('bob@example.com', 'Bob',   '$2a$10$nb4k/em5RGv4fKVW5BoJF.uQsF7qx8tBPDQn62JESXqWgBGtRiRiG')
ON CONFLICT (email) DO NOTHING;

-- Tableau Kanban principal
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Colonnes d'un board (Todo / Doing / Done)
CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL
);

-- Cartes/tâches dans une colonne
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL
);

-- Données d'exemple pour démarrer
INSERT INTO boards (id, name)
VALUES (1, 'FlowBoard Dev')
ON CONFLICT (id) DO NOTHING;

INSERT INTO columns (id, board_id, title, position)
VALUES 
    (1, 1, 'Todo', 0),
    (2, 1, 'In Progress', 1),
    (3, 1, 'Done', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cards (id, column_id, title, description, position)
VALUES
    (1, 1, 'Installer Tailwind', 'Configurer Tailwind v4 dans Vite + Docker', 0),
    (2, 1, 'Setup Backend', 'API Node + Express + Socket.io + Postgres', 1),
    (3, 2, 'Docker Compose', 'Tout doit tourner en conteneurs', 0),
    (4, 3, 'Hello World', 'Premier composant React qui marche', 0)
ON CONFLICT (id) DO NOTHING;
