class AddCoordinatesToChantiers < ActiveRecord::Migration[7.1]
  def change
    add_column :chantiers, :latitude, :decimal, precision: 10, scale: 6
    add_column :chantiers, :longitude, :decimal, precision: 10, scale: 6
  end
end
