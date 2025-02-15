# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    name { "John Doe" }
    email { "john@example.com" }
    password { 'password' }
  end
end

# spec/factories/videos.rb
FactoryBot.define do
  factory :video do
    youtube_id { "abcd1234" }
    association :owner, factory: :user
  end
end
