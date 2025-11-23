# db/seeds.rb

puts "🌱 Création de données de test..."

# Nettoyer les données existantes (optionnel)
puts "🧹 Nettoyage..."
# Intervention.destroy_all
# DailyAssignment.destroy_all
# Chantier.destroy_all

# Créer des chantiers types
chantiers_templates = [
  {
    name: "Débouchage canalisation",
    location: "15 Rue Victor Hugo, Bruxelles",
    description: "Débouchage urgent suite à obstruction complète de la canalisation principale.",
    duration: 120,
    extra_equipment: true,
    two_operators: false
  },
  {
    name: "Curage réseau égouts",
    location: "42 Avenue Louise, Bruxelles",
    description: "Curage préventif du réseau d'égouts avec inspection caméra.",
    duration: 180,
    extra_equipment: false,
    two_operators: true
  },
  {
    name: "Inspection caméra",
    location: "8 Rue de la Loi, Bruxelles",
    description: "Inspection complète du réseau avec rapport détaillé.",
    duration: 90,
    extra_equipment: true,
    two_operators: false
  },
  {
    name: "Réparation fuite",
    location: "23 Boulevard Anspach, Bruxelles",
    description: "Réparation d'urgence d'une fuite importante détectée.",
    duration: 150,
    extra_equipment: true,
    two_operators: true
  },
  {
    name: "Entretien préventif",
    location: "67 Chaussée de Wavre, Bruxelles",
    description: "Entretien trimestriel du réseau avec nettoyage haute pression.",
    duration: 120,
    extra_equipment: false,
    two_operators: false
  }
]

# Créer 10 chantiers par jour du 23 nov au 1er déc
date_debut = Date.new(2025, 11, 23)
date_fin = Date.new(2025, 12, 1)

(date_debut..date_fin).each do |date|
  puts "📅 Création chantiers pour #{date.strftime('%d/%m/%Y')}"

  10.times do |i|
    template = chantiers_templates.sample

    Chantier.create!(
      name: "#{template[:name]} ##{i+1}",
      location: template[:location],
      description: template[:description],
      duration: template[:duration],
      scheduled_date: date,
      extra_equipment: template[:extra_equipment],
      two_operators: template[:two_operators],
      email: "contact#{i+1}@example.com",
      phone: "0#{rand(4..9)}#{rand(10..99)}#{rand(10..99)}#{rand(10..99)}#{rand(10..99)}"
    )
  end
end

total_chantiers = Chantier.count
puts "✅ #{total_chantiers} chantiers créés !"
puts "📊 Dates couvertes : #{date_debut.strftime('%d/%m/%Y')} → #{date_fin.strftime('%d/%m/%Y')}"
