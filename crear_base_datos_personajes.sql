
CREATE TABLE IF NOT EXISTS especies (
    especie_id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS personajes (
    personaje_id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    ocupacion VARCHAR(100),
    descripcion TEXT,
    imagen VARCHAR(255),
    especie_id INTEGER NOT NULL,
    CONSTRAINT fk_personaje_especie
      FOREIGN KEY (especie_id)
      REFERENCES especies(especie_id)
);

INSERT INTO especies (nombre) VALUES
('Robot'),
('Humano'),
('Humanoide'),
('Decapodiano'),
('Nibbloniano'),
('Alienígena')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO personajes (nombre, ocupacion, descripcion, imagen, especie_id) VALUES
('Bender Bending Rodríguez', 'Doblador', 'Robot doblador irreverente y cínico, conocido por su sarcasmo, sus malos hábitos y su amor por el alcohol y la conducta cuestionable.', 'img/bender.png', 1),
('Philip J. Fry', 'Repartidor', 'Joven ingenuo y de buen corazón, transportado desde el siglo XX al futuro. Despistado pero afectuoso, su optimismo y lealtad lo convierten en el motor emocional del grupo.', 'img/fry.png', 2),
('Turanga Leela', 'Capitana', 'Capitana competente, fuerte y responsable; excelente piloto y líder natural. Suele actuar como la voz de la razón del equipo.', 'img/leela.png', 3),
('Professor Farnsworth', 'Inventor', 'Anciano inventor excéntrico y brillante, creador de innumerables artefactos peligrosos y revolucionarios.', 'img/professor.png', 2),
('Dr. John A. Zoidberg', 'Doctor', 'Médico decapodiano socialmente torpe y desafortunado cuya incompetencia clínica contrasta con su enorme simpatía.', 'img/zoidberg.png', 4),
('Hermes Conrad', 'Burócrata', 'Funcionario metódico y perfeccionista, experto en trámites y administración. Valora el orden y la eficiencia por encima de todo.', 'img/hermes.png', 2),
('Amy Wong', 'Ingeniera / Pasante', 'Joven ingeniera alegre y sociable, con un estilo moderno y a veces caprichoso. Aporta energía, humor y habilidad técnica.', 'img/amy.png', 2),
('Lord Nibbler', 'Mascota / Noble', 'Criatura antigua y enigmática con gran inteligencia y un papel crucial en hechos cósmicos.', 'img/nibbler.png', 5),
('Scruffy', 'Conserje', 'Conserje taciturno y de pocas palabras que trabaja en Planet Express. Aparentemente despreocupado y minimalista.', 'img/scruffy.png', 2),
('Zapp Brannigan', 'Capitán', 'Oficial militar pomposo y vanidoso, excesivamente confiado y falto de tacto estratégico.', 'img/zapp.png', 2),
('Kif Kroker', 'Teniente', 'Subordinado sensible, tímido y leal, frecuentemente exasperado por la incompetencia de su superior.', 'img/kif.png', 6),
('Mom', 'Empresaria', 'Magnate empresarial aparentemente amable que en realidad es despiadada y manipuladora en los negocios.', 'img/mom.png', 2);

SELECT 
    p.personaje_id AS id,
    p.nombre,
    p.ocupacion,
    p.descripcion,
    p.imagen AS image,
    e.nombre AS especie
FROM personajes AS p
INNER JOIN especies AS e
    ON p.especie_id = e.especie_id
ORDER BY p.personaje_id;

