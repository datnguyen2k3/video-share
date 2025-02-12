require 'uri'

module VideoServices
  class Create

    attr_reader :owner_id, :url

    def initialize(param)
      @url = param[:url]
      @owner_id = param[:owner_id]
    end

    def call
      validate_youtube_url
      validate_not_found_video

      video = ::Video.new(owner_id: owner_id, youtube_id: youtube_id)
      video.save!
      video
    end

    def validate_youtube_url
      youtube_regex = /\Ahttps:\/\/(www\.)?(youtube\.com\/(?:watch\?v=|(?:v|e(?:mbed)?)\/)|youtu\.be\/)[\w-]+\z/
      unless url.match?(youtube_regex)
        raise InvalidVideoUrl
      end
    end

    def validate_not_found_video
      existed_video = ::Video.find_by(youtube_id: youtube_id)
      if existed_video
        raise ExistedVideoError
      end
    end

    def youtube_id
      return @youtube_id if defined? @youtube_id

      youtube_regex = /(?:youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|\S+\/\S+\/)|\/(?:v|e(?:mbed)?)\/))([^&=%\?\/\n\s]+)/
      match = url.match(youtube_regex)
      @youtube_id = match ? match[1] : nil
    end
  end
end
