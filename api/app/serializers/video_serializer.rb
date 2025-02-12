class VideoSerializer < ActiveModel::Serializer
  attributes :id, :owner_id, :youtube_id, :created_at, :updated_at
end
