require "test_helper"

class Admin::PlanningControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get admin_planning_index_url
    assert_response :success
  end
end
