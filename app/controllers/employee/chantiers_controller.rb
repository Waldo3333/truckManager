# app/controllers/employee/chantiers_controller.rb
class Employee::ChantiersController < ApplicationController
  before_action :require_employee

  def show
    @chantier = Chantier.find(params[:id])

    # Test 1 : Vérifier que l'action est bien appelée
    render plain: "ACTION SHOW APPELÉE - Chantier: #{@chantier.name}"
  end
end
