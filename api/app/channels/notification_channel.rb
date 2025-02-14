class NotificationChannel < ActionCable::Channel::Base
  def subscribed
    stream_from "notifications"
  end
end
