class AddCopyFieldsToChantiers < ActiveRecord::Migration[7.1]
  def change
    add_column :chantiers, :copy, :boolean, default: false, null: false
    add_column :chantiers, :original_id, :integer, null: true
  end
end
