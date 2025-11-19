class AddScheduledDateToChantiers < ActiveRecord::Migration[7.0]
  def change
    add_column :chantiers, :scheduled_date, :date, null: true
  end
end
