# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :authenticate_user!

  private

  def require_admin
    unless current_user&.admin?
      redirect_to employee_root_path, alert: "Accès réservé aux administrateurs"
    end
  end

  def require_employee
    unless current_user
      redirect_to new_user_session_path, alert: "Vous devez être connecté"
    end
  end
end
