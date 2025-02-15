class SendNotificationJob
  include Sidekiq::Job

  def perform(video_id, owner_id, youtube_id, owner_email, owner_name)
    ActionCable.server.broadcast 'notifications', {
      video_id: video_id,
      owner_id: owner_id,
      youtube_id: youtube_id,
      owner_email: owner_email,
      owner_name: owner_name
    }
  end
end
