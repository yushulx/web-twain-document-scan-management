Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get 'twainscanning/home'

  root 'twainscanning#home'

  post 'upload/' => 'twainscanning#upload'

end
