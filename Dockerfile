FROM public.ecr.aws/lambda/nodejs:16-arm64

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production

# Bundle app source
COPY . /var/task

RUN npm run build

# # Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "dst/app.handler" ]
