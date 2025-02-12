class Video < ApplicationRecord
  belongs_to :owner, class_name: "User"

  validates :youtube_id, presence: true
end
