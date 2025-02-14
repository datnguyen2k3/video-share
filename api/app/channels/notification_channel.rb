class NotificationChannel < ActionCable::Channel::Base
  def subscribed
    stream_from "notifications"
    broadcast_to(
      "notifications",
      "hello"
    )
  end

  def unsubscribed

  end
end
