class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }

  has_many :videos, foreign_key: "owner_id", dependent: :destroy
end
