module ApplicationCable
  class NotificationChannel  < ActionCable::Channel::Base
    def subscribed
      stream_from "notifications_#{current_user.id}"
    end

    def unsubscribed

    end
  end
end
