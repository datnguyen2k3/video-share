module VideoServices
  class GetByCursor

    attr_reader :cursor, :limit

    def initialize(cursor, limit = 10)
      @cursor = cursor || -1
      @limit = limit
    end

    def call
      videos = ::Video.where("id > ?", cursor.to_i)
                      .order(id: :asc)
                      .limit(limit)

      next_cursor = videos.count == limit ? videos.last&.id : nil

      {
        videos: videos,
        next_cursor: next_cursor
      }
    end
  end
end