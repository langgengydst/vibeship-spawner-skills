# Use Node.js as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy repo root files (needed for registry.yaml and structure)
COPY registry.yaml .
COPY schema.yaml .
COPY package.json .

# Copy skill directories (excluding mcp-server for now)
COPY ai/ ai/
COPY ai-agents/ ai-agents/
COPY backend/ backend/
COPY community/ community/
COPY creative/ creative/
COPY data/ data/
COPY design/ design/
COPY development/ development/
COPY devops/ devops/
COPY education/ education/
COPY enterprise/ enterprise/
COPY finance/ finance/
COPY frameworks/ frameworks/
COPY frontend/ frontend/
COPY game-dev/ game-dev/
COPY maker/ maker/
COPY marketing/ marketing/
COPY mind/ mind/
COPY product/ product/
COPY security/ security/
COPY startup/ startup/
COPY strategy/ strategy/
COPY testing/ testing/
COPY trading/ trading/

# Setup MCP Server
WORKDIR /app/mcp-server
COPY mcp-server/package.json .
COPY mcp-server/tsconfig.json .
COPY mcp-server/src src/

# Install dependencies
RUN npm install

# Build the server
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
