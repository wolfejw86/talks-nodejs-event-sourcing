const registerCommandSubscriber = fastify.messageStore.createSubscriber({
  handlers: {
    Register: async command => {
      const currentIdentityStream = `identity-${command.data.userId}`;
      const existingEntity = await fastify.messageStore.loadEntity(
        currentIdentityStream,
        userIdentityProjection
      );

      if (existingEntity.isRegistered) {
        // noop because we've already done this and this is a replay
        return;
      }

      // we have a new user registration - record event for aggregators and history
      await fastify.messageStore.writeToStream(
        currentIdentityStream,
        formatStreamMessage('Registered', command.data, command.metadata)
      );
    },
  },
  streamName: 'identity:command',
  subscriberId: 'components:identity:command',
});