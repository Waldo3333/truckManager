# app/controllers/employee/chantiers_controller.rb
class Employee::ChantiersController < ApplicationController
  before_action :require_employee

  def show
    @chantier = Chantier.find(params[:id])
    render partial: 'chantier_info', locals: { chantier: @chantier }, layout: false
  end
end
