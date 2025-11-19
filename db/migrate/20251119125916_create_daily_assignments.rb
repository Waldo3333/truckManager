class CreateDailyAssignments < ActiveRecord::Migration[7.1]
  def change
    create_table :daily_assignments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :truck, null: false, foreign_key: true
      t.date :date

      t.timestamps

    end
    # Un camion = un seul conducteur par jour
  add_index :daily_assignments, [:truck_id, :date], unique: true
    # Un salarié = un seul camion par jour
  add_index :daily_assignments, [:user_id, :date], unique: true
  end
end
