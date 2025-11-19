class RemoveEndTimeFromInterventions < ActiveRecord::Migration[7.0]
  def change
    remove_column :interventions, :end_time, :time
  end
end
