FROM node:13

USER node

ENV PORT 8000
ENV PLANET_HOME /home/node/sagan
RUN mkdir -p ${PLANET_HOME}
RUN chown node:node ${PLANET_HOME}
ADD ./package.json ${PLANET_HOME}
COPY . ${PLANET_HOME}

WORKDIR ${PLANET_HOME}

RUN npm install

EXPOSE ${PORT}

CMD [ "npm", "start" ]