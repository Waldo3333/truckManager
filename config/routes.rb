Rails.application.routes.draw do
  devise_for :users

  root "homes#index"

  namespace :admin do
    get 'planning/index'
    get 'chantiers/index'
    get 'chantiers/new'
    get 'chantiers/create'
    get 'chantiers/edit'
    get 'chantiers/update'
    get 'chantiers/destroy'
    get 'trucks/index'
    get 'trucks/new'
    get 'trucks/create'
    get 'trucks/edit'
    get 'trucks/update'
    get 'trucks/destroy'
    get 'users/index'
    get 'users/new'
    get 'users/create'
    get 'users/edit'
    get 'users/update'
    get 'users/destroy'
    root to: "dashboard#index"  # /admin
    get 'planning', to: 'planning#index'
    resources :chantiers
    resources :trucks
    resources :users
    resources :daily_assignments
    resources :interventions, only: [:create,:update, :destroy]
  end
end
