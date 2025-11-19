require "test_helper"

class Admin::TrucksControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get admin_trucks_index_url
    assert_response :success
  end

  test "should get new" do
    get admin_trucks_new_url
    assert_response :success
  end

  test "should get create" do
    get admin_trucks_create_url
    assert_response :success
  end

  test "should get edit" do
    get admin_trucks_edit_url
    assert_response :success
  end

  test "should get update" do
    get admin_trucks_update_url
    assert_response :success
  end

  test "should get destroy" do
    get admin_trucks_destroy_url
    assert_response :success
  end
end
