class VideoSerializer < ActiveModel::Serializer
  attributes :id, :owner_id, :youtube_id, :created_at, :updated_at, :owner_name, :owner_email

  def owner_name
    object.owner.name
  end

  def owner_email
    object.owner.email
  end
end
