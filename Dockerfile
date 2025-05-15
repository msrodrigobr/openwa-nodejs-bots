FROM  openwa/wa-automate
USER root
COPY ./docker /etc/helpers/
WORKDIR /app
RUN chmod +x /etc/helpers/start.sh
#COPY ./src /app/
#RUN npm install --production
#ENTRYPOINT ["/usr/local/bin/node"]
#CMD ["index.js"]
ENTRYPOINT [ "/etc/helpers/start.sh" ]
#CMD ["install", "--production", "&&", "tail", "-f", "/dev/null"]