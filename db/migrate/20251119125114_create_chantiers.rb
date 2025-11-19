class CreateChantiers < ActiveRecord::Migration[7.1]
  def change
    create_table :chantiers do |t|

      t.timestamps
      t.string :name
      t.string :location
      t.integer :duration
    end
  end
end
