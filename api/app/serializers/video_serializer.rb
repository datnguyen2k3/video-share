class VideoSerializer < ActiveModel::Serializer
  attributes :id, :owner_id, :youtube_id, :created_at, :updated_at, :owner_name, :owner_email

  def owner_name
    object.owner.name
  end

  def owner_email
    object.owner.email
  end

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end
