require "test_helper"

class Admin::ChantiersControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get admin_chantiers_index_url
    assert_response :success
  end

  test "should get new" do
    get admin_chantiers_new_url
    assert_response :success
  end

  test "should get create" do
    get admin_chantiers_create_url
    assert_response :success
  end

  test "should get edit" do
    get admin_chantiers_edit_url
    assert_response :success
  end

  test "should get update" do
    get admin_chantiers_update_url
    assert_response :success
  end

  test "should get destroy" do
    get admin_chantiers_destroy_url
    assert_response :success
  end
end
