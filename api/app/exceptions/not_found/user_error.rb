module Exceptions
  module NotFound
    class UserError < GeneralError
      def initialize(details = {})
        super("User not found", details)
      end
    end
  end
end