# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_11_20_101532) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "chantiers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "location"
    t.integer "duration"
    t.date "scheduled_date"
    t.string "email"
    t.string "phone"
    t.text "description"
    t.boolean "extra_equipment", default: false
    t.boolean "two_operators", default: false
  end

  create_table "daily_assignments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "truck_id", null: false
    t.date "date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["truck_id", "date"], name: "index_daily_assignments_on_truck_id_and_date", unique: true
    t.index ["truck_id"], name: "index_daily_assignments_on_truck_id"
    t.index ["user_id", "date"], name: "index_daily_assignments_on_user_id_and_date", unique: true
    t.index ["user_id"], name: "index_daily_assignments_on_user_id"
  end

  create_table "interventions", force: :cascade do |t|
    t.bigint "truck_id", null: false
    t.bigint "chantier_id", null: false
    t.date "date", null: false
    t.time "start_time", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chantier_id"], name: "index_interventions_on_chantier_id"
    t.index ["truck_id"], name: "index_interventions_on_truck_id"
  end

  create_table "trucks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "daily_assignments", "trucks"
  add_foreign_key "daily_assignments", "users"
  add_foreign_key "interventions", "chantiers"
  add_foreign_key "interventions", "trucks"
end
