export interface StoreItem {
  id: string;
  name: string;
  biomeId: 'forest' | 'desert' | 'mountain' | 'city';
  category: 'fauna' | 'characters' | 'structures' | 'nature' | 'legendary';
  icon: string;
  price: number;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export const STORE_CATEGORIES = [
  { id: 'all', label: 'Todos los Objetos', icon: '✨' },
  { id: 'fauna', label: 'Mascotas y Fauna', icon: '🦊' },
  { id: 'characters', label: 'Personajes y Guardianes', icon: '🧑‍🌾' },
  { id: 'structures', label: 'Estructuras y Hábitats', icon: '🏡' },
  { id: 'nature', label: 'Flora y Paisaje', icon: '🌺' },
  { id: 'legendary', label: 'Eco-Legendarios', icon: '👑' },
] as const;

export const STORE_ITEMS: StoreItem[] = [
  // ==========================================
  // 🌲 BIOMA 1: BOSQUE (FOREST)
  // ==========================================
  // Fauna & Mascotas
  { id: 'forest_cat', name: 'Gato Montés', biomeId: 'forest', category: 'fauna', icon: '🐈', price: 100, description: 'Un felino ágil y curioso que cuida los senderos.', rarity: 'common' },
  { id: 'forest_dog', name: 'Perro Explorador', biomeId: 'forest', category: 'fauna', icon: '🐕', price: 150, description: 'Guía leal que acompaña las caminatas verdes.', rarity: 'common' },
  { id: 'forest_owl', name: 'Búho Sabio', biomeId: 'forest', category: 'fauna', icon: '🦉', price: 200, description: 'Vigila la salud nocturna del bosque.', rarity: 'rare' },
  { id: 'forest_deer', name: 'Ciervo Noble', biomeId: 'forest', category: 'fauna', icon: '🦌', price: 250, description: 'Símbolo de serenidad y equilibrio natural.', rarity: 'rare' },
  { id: 'forest_fox', name: 'Zorro Rojo', biomeId: 'forest', category: 'fauna', icon: '🦊', price: 300, description: 'Guardián astuto de los claros del bosque.', rarity: 'rare' },
  { id: 'forest_hedgehog', name: 'Erizo del Musgo', biomeId: 'forest', category: 'fauna', icon: '🦔', price: 120, description: 'Pequeño ayudante que dispersa semillas.', rarity: 'common' },
  { id: 'forest_badger', name: 'Tejón Constructor', biomeId: 'forest', category: 'fauna', icon: '🦡', price: 180, description: 'Experto excavador de raíces y madrigueras.', rarity: 'common' },

  // Personajes
  { id: 'forest_hiker', name: 'Excursionista Ecológico', biomeId: 'forest', category: 'characters', icon: '🚶', price: 250, description: 'Promueve el turismo responsable sin dejar rastro.', rarity: 'common' },
  { id: 'forest_ranger', name: 'Guardabosques Unison', biomeId: 'forest', category: 'characters', icon: '🧑‍🌾', price: 350, description: 'Protege la reserva de incendios y tala ilegal.', rarity: 'epic' },
  { id: 'forest_botanist', name: 'Bióloga Botánica', biomeId: 'forest', category: 'characters', icon: '👩‍🔬', price: 300, description: 'Estudia especies nativas de flora y hongos.', rarity: 'rare' },

  // Estructuras
  { id: 'forest_cabin', name: 'Cabaña de Madera Caída', biomeId: 'forest', category: 'structures', icon: '🛖', price: 400, description: 'Refugio bioclimático construido con madera muerta.', rarity: 'epic' },
  { id: 'forest_tent', name: 'Campamento Solar', biomeId: 'forest', category: 'structures', icon: '⛺', price: 220, description: 'Tienda de bajo impacto con luminaria solar.', rarity: 'common' },
  { id: 'forest_bridge', name: 'Puente de Liana Viva', biomeId: 'forest', category: 'structures', icon: '🪵', price: 280, description: 'Cruce ecológico sobre arroyos boscosos.', rarity: 'rare' },

  // Flora y Paisaje
  { id: 'forest_mushrooms', name: 'Hongos Bioluminiscentes', biomeId: 'forest', category: 'nature', icon: '🍄', price: 140, description: 'Descomponedores naturales que iluminan la noche.', rarity: 'common' },
  { id: 'forest_flowers', name: 'Flores Silvestres Nativas', biomeId: 'forest', category: 'nature', icon: '🌸', price: 90, description: 'Atracción primordial para abejas y mariposas.', rarity: 'common' },
  { id: 'forest_campfire', name: 'Fogata Ecológica de Rocas', biomeId: 'forest', category: 'nature', icon: '🔥', price: 160, description: 'Zona segura de convivencia y cuentos verdes.', rarity: 'rare' },

  // Legendarios
  { id: 'forest_tree_spirit', name: 'Árbol Milenario Ancestro', biomeId: 'forest', category: 'legendary', icon: '🌳', price: 600, description: 'Un ser botánico ancestral que purifica todo el aire.', rarity: 'legendary' },
  { id: 'forest_guardian_totem', name: 'Tótem de los Cuatro Elementos', biomeId: 'forest', category: 'legendary', icon: '🗿', price: 750, description: 'Escultura conmemorativa de la armonía comunitaria.', rarity: 'legendary' },


  // ==========================================
  // 🌵 BIOMA 2: DESÉRTICO (DESERT)
  // ==========================================
  // Fauna
  { id: 'desert_cat', name: 'Gato de Arena', biomeId: 'desert', category: 'fauna', icon: '🐅', price: 100, description: 'Maestro de la supervivencia en dunas ardientes.', rarity: 'common' },
  { id: 'desert_dog', name: 'Coyote Explorador', biomeId: 'desert', category: 'fauna', icon: '🐕‍🦺', price: 150, description: 'Vocalista nocturno de las tierras secas.', rarity: 'common' },
  { id: 'desert_camel', name: 'Dromedario de Carga', biomeId: 'desert', category: 'fauna', icon: '🐪', price: 250, description: 'Resistente viajero que no desperdicia una gota.', rarity: 'rare' },
  { id: 'desert_fennec', name: 'Zorro Fénec Orejudo', biomeId: 'desert', category: 'fauna', icon: '🦊', price: 320, description: 'Capta las brisas más suaves para enfriar su cuerpo.', rarity: 'epic' },
  { id: 'desert_scorpion', name: 'Escorpión Dorado', biomeId: 'desert', category: 'fauna', icon: '🦂', price: 130, description: 'Habitante sigiloso de las grietas rocosas.', rarity: 'common' },
  { id: 'desert_lizard', name: 'Monstruo de Gila', biomeId: 'desert', category: 'fauna', icon: '🦎', price: 190, description: 'Reptil icónico de los desiertos sonorenses.', rarity: 'rare' },

  // Personajes
  { id: 'desert_nomad', name: 'Guía Nómada del Sol', biomeId: 'desert', category: 'characters', icon: '🧕', price: 300, description: 'Comparte conocimientos ancestrales de ahorro de agua.', rarity: 'rare' },
  { id: 'desert_astronomer', name: 'Astrónomo de Cielos Claros', biomeId: 'desert', category: 'characters', icon: '🧑‍🚀', price: 350, description: 'Aprovecha las noches sin contaminación lumínica.', rarity: 'epic' },

  // Estructuras
  { id: 'desert_oasis_hut', name: 'Domo Geodésico Térmico', biomeId: 'desert', category: 'structures', icon: '🛖', price: 380, description: 'Arquitectura vernácula que mantiene frescura interior.', rarity: 'rare' },
  { id: 'desert_windpump', name: 'Bomba Eólica de Pozo', biomeId: 'desert', category: 'structures', icon: '🎐', price: 420, description: 'Extrae agua profunda usando solo fuerza del viento.', rarity: 'epic' },

  // Flora y Paisaje
  { id: 'desert_cactus_giant', name: 'Saguaros Gigantes en Flor', biomeId: 'desert', category: 'nature', icon: '🌵', price: 160, description: 'Cactus centenarios que albergan nidos de aves.', rarity: 'common' },
  { id: 'desert_oasis_palms', name: 'Palmeras de Oasis Natural', biomeId: 'desert', category: 'nature', icon: '🌴', price: 260, description: 'Sombra reparadora y dátiles sustentables.', rarity: 'rare' },
  { id: 'desert_pottery', name: 'Tinajas de Barro Tradicional', biomeId: 'desert', category: 'nature', icon: '🏺', price: 110, description: 'Enfrían el agua por evaporación sin electricidad.', rarity: 'common' },

  // Legendarios
  { id: 'desert_sun_temple', name: 'Santuario Solar del Desierto', biomeId: 'desert', category: 'legendary', icon: '🏛️', price: 800, description: 'Monumento de piedra que canaliza energía solar infinita.', rarity: 'legendary' },
  { id: 'desert_crystal_fountain', name: 'Manantial Espejo Eterno', biomeId: 'desert', category: 'legendary', icon: '⛲', price: 900, description: 'Oasis mágico nacido de la austeridad y cuidado del agua.', rarity: 'legendary' },


  // ==========================================
  // ⛰️ BIOMA 3: MONTAÑAS (MOUNTAIN)
  // ==========================================
  // Fauna
  { id: 'mountain_goat', name: 'Cabra Montés', biomeId: 'mountain', category: 'fauna', icon: '🐐', price: 150, description: 'Escaladora intrépida de riscos empinados.', rarity: 'common' },
  { id: 'mountain_eagle', name: 'Águila Real', biomeId: 'mountain', category: 'fauna', icon: '🦅', price: 250, description: 'Reina de las corrientes térmicas de gran altura.', rarity: 'rare' },
  { id: 'mountain_bear', name: 'Oso Pardo Guardián', biomeId: 'mountain', category: 'fauna', icon: '🐻', price: 400, description: 'Protector de las cuencas altas de los ríos.', rarity: 'epic' },
  { id: 'mountain_llama', name: 'Llama Andina', biomeId: 'mountain', category: 'fauna', icon: '🦙', price: 220, description: 'Amigable compañera de senderos andinos.', rarity: 'common' },
  { id: 'mountain_wolf', name: 'Lobo de Cumbre', biomeId: 'mountain', category: 'fauna', icon: '🐺', price: 380, description: 'Líder de la manada que equilibra la cadena trófica.', rarity: 'epic' },
  { id: 'mountain_condor', name: 'Cóndor de las Alturas', biomeId: 'mountain', category: 'fauna', icon: '🕊️', price: 300, description: 'El ave planeadora más majestuosa del planeta.', rarity: 'rare' },

  // Personajes
  { id: 'mountain_climber', name: 'Alpinista Sustentable', biomeId: 'mountain', category: 'characters', icon: '🧗', price: 350, description: 'Limpia residuos de alta montaña en cada ascenso.', rarity: 'rare' },
  { id: 'mountain_monk', name: 'Sabio de la Cumbre', biomeId: 'mountain', category: 'characters', icon: '🧘', price: 450, description: 'Enseña la meditación y el respeto a la tierra.', rarity: 'epic' },

  // Estructuras
  { id: 'mountain_refuge', name: 'Refugio Térmico de Altura', biomeId: 'mountain', category: 'structures', icon: '🏠', price: 450, description: 'Aislado con lana natural para evitar quema de leña.', rarity: 'epic' },
  { id: 'mountain_wind_turbine', name: 'Aerogenerador de Viento Fuerte', biomeId: 'mountain', category: 'structures', icon: '🌀', price: 500, description: 'Genera kilowatts limpios aprovechando vendavales.', rarity: 'epic' },

  // Flora y Paisaje
  { id: 'mountain_crystal', name: 'Geoda de Cuarzo Puro', biomeId: 'mountain', category: 'nature', icon: '💎', price: 200, description: 'Mineral que refleja la luz del amanecer alpino.', rarity: 'rare' },
  { id: 'mountain_pine_snow', name: 'Pinos Nevados de Altura', biomeId: 'mountain', category: 'nature', icon: '🌲', price: 180, description: 'Retienen la nieve que luego alimenta los ríos.', rarity: 'common' },
  { id: 'mountain_glacier_stream', name: 'Arroyo de Deshielo Puro', biomeId: 'mountain', category: 'nature', icon: '🌊', price: 240, description: 'Agua mineral cristalina nacida en la cumbre.', rarity: 'rare' },

  // Legendarios
  { id: 'mountain_beacon', name: 'Faro Solar de las Nieves', biomeId: 'mountain', category: 'legendary', icon: '🗼', price: 850, description: 'Guía a exploradores con un haz de energía pura.', rarity: 'legendary' },
  { id: 'mountain_crystal_dragon', name: 'Dragón Guardián de los Hielos', biomeId: 'mountain', category: 'legendary', icon: '🐲', price: 1000, description: 'Mítica criatura que preserva los glaciares eternos.', rarity: 'legendary' },


  // ==========================================
  // 🏙️ BIOMA 4: CIUDAD VERDE (CITY) - META SUPREMA
  // ==========================================
  // Fauna
  { id: 'city_cat', name: 'Gato Urbano Adoptado', biomeId: 'city', category: 'fauna', icon: '🐈‍⬛', price: 100, description: 'Mascota rescatada que vive feliz en azoteas verdes.', rarity: 'common' },
  { id: 'city_dog', name: 'Perro Guía Comunitario', biomeId: 'city', category: 'fauna', icon: '🦮', price: 150, description: 'Asiste a vecinos y pasea por ciclovías.', rarity: 'common' },
  { id: 'city_pigeon', name: 'Paloma Mensajera Ecológica', biomeId: 'city', category: 'fauna', icon: '🕊️', price: 50, description: 'Símbolo de paz y convivencia urbana armónica.', rarity: 'common' },
  { id: 'city_bee_hive', name: 'Colmena de Abejas Urbanas', biomeId: 'city', category: 'fauna', icon: '🐝', price: 250, description: 'Polinizan los huertos en las azoteas de la metrópoli.', rarity: 'rare' },
  { id: 'city_butterfly_sanctuary', name: 'Mariposas Monarca Urbanas', biomeId: 'city', category: 'fauna', icon: '🦋', price: 220, description: 'Encuentran flores libres de pesticidas en cada calle.', rarity: 'rare' },

  // Personajes
  { id: 'city_cyclist', name: 'Ciclista de Movilidad Cero Emisiones', biomeId: 'city', category: 'characters', icon: '🚴', price: 200, description: 'Usa la bicicleta para todos sus traslados diarios.', rarity: 'common' },
  { id: 'city_gardener', name: 'Agricultor Urbano en Azoteas', biomeId: 'city', category: 'characters', icon: '🧑‍🌾', price: 280, description: 'Produce hortalizas frescas en pleno centro urbano.', rarity: 'rare' },
  { id: 'city_recycler', name: 'Embajadora de Economía Circular', biomeId: 'city', category: 'characters', icon: '👩‍🏫', price: 320, description: 'Transforma residuos en nuevos recursos útiles.', rarity: 'epic' },
  { id: 'city_scooter', name: 'Estudiante en Monopatín Eléctrico', biomeId: 'city', category: 'characters', icon: '🛴', price: 180, description: 'Viaja hacia la universidad con energía renovable.', rarity: 'common' },

  // Estructuras
  { id: 'city_solar_bus', name: 'Estación de Autobús Solar', biomeId: 'city', category: 'structures', icon: '🚏', price: 350, description: 'Parada inteligente con recarga fotovoltaica.', rarity: 'rare' },
  { id: 'city_wind_turbine', name: 'Mini Molino Eólico Urbano', biomeId: 'city', category: 'structures', icon: '🪁', price: 380, description: 'Generación distribuida para iluminar el parque.', rarity: 'rare' },
  { id: 'city_green_building', name: 'Edificio con Fachada Vegetal', biomeId: 'city', category: 'structures', icon: '🏢', price: 550, description: 'Rascacielos cubierto de plantas que absorbe CO2.', rarity: 'epic' },
  { id: 'city_tram', name: 'Tranvía 100% Eléctrico', biomeId: 'city', category: 'structures', icon: '🚋', price: 650, description: 'Transporte masivo ecológico y accesible para todos.', rarity: 'epic' },

  // Flora y Paisaje
  { id: 'city_rooftop_garden', name: 'Huerto Orgánico Comunitario', biomeId: 'city', category: 'nature', icon: '🥗', price: 200, description: 'Tomates, lechugas y hierbas cultivados por vecinos.', rarity: 'rare' },
  { id: 'city_solar_panels', name: 'Parque de Paneles Solares', biomeId: 'city', category: 'nature', icon: '⚡', price: 320, description: 'Células de silicio de alta eficiencia energética.', rarity: 'rare' },
  { id: 'city_bench', name: 'Banca con Sombra de Madera Reciclada', biomeId: 'city', category: 'nature', icon: '🪑', price: 120, description: 'Punto de encuentro para charlar sobre sustentabilidad.', rarity: 'common' },
  { id: 'city_recycle_station', name: 'Centro de Clasificación 5 Fracciones', biomeId: 'city', category: 'nature', icon: '♻️', price: 180, description: 'Puntos limpios para plástico, vidrio, papel y metal.', rarity: 'common' },

  // Legendarios
  { id: 'city_tree_of_life', name: 'Monumento a la Madre Tierra', biomeId: 'city', category: 'legendary', icon: '🗽', price: 900, description: 'Gran estatua verde erigida en honor a la Ciudad Sostenible.', rarity: 'legendary' },
  { id: 'city_eco_dome', name: 'Biósfera Urbana Autosuficiente', biomeId: 'city', category: 'legendary', icon: '🌐', price: 1200, description: 'Cúpula tecnológica que purifica el 100% de los residuos y agua.', rarity: 'legendary' },
];
