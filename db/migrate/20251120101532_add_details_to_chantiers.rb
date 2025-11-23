class AddDetailsToChantiers < ActiveRecord::Migration[7.1]
  def change
    add_column :chantiers, :email, :string
    add_column :chantiers, :phone, :string
    add_column :chantiers, :description, :text
    add_column :chantiers, :extra_equipment, :boolean, default: false
    add_column :chantiers, :two_operators, :boolean, default: false
  end
end
