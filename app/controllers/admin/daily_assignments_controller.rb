# app/controllers/admin/daily_assignments_controller.rb
class Admin::DailyAssignmentsController < ApplicationController
  before_action :require_admin

  def create
    @assignment = DailyAssignment.new(assignment_params)

    if @assignment.save
      redirect_to admin_planning_path(date: @assignment.date), notice: "Conducteur assigné avec succès"
    else
      redirect_to admin_planning_path(date: params[:daily_assignment][:date]), alert: @assignment.errors.full_messages.join(', ')
    end
  end

  def update
    @assignment = DailyAssignment.find(params[:id])

    if @assignment.update(assignment_params)
      redirect_to admin_planning_path(date: @assignment.date), notice: "Assignation mise à jour"
    else
      redirect_to admin_planning_path(date: @assignment.date), alert: @assignment.errors.full_messages.join(', ')
    end
  end

  def destroy
    @assignment = DailyAssignment.find(params[:id])
    date = @assignment.date
    @assignment.destroy

    redirect_to admin_planning_path(date: date), notice: "Assignation supprimée"
  end

  private

  def assignment_params
    params.require(:daily_assignment).permit(:truck_id, :user_id, :date)
  end
end
