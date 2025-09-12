{
  "info": {
    "name": "PROJETDOCKER - Game API",
    "_postman_id": "1d2a3b4c-5678-9012-3456-abcdefabcdef",
    "description": "CRUD complet pour l'API Games (localhost:3000)",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/"
      }
    },
    {
      "name": "Ping API",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/ping"
      }
    },
    {
      "name": "Create Game",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"The Legend of Zelda\",\n  \"platform\": \"Switch\",\n  \"price\": 80\n}"
        },
        "url": "http://localhost:3000/api/games"
      }
    },
    {
      "name": "List Games",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/games"
      }
    },
    {
      "name": "Get Game by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/games/{{gameId}}"
      }
    },
    {
      "name": "Update Game",
      "request": {
        "method": "PUT",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Zelda Updated\",\n  \"price\": 59.99\n}"
        },
        "url": "http://localhost:3000/api/games/{{gameId}}"
      }
    },
    {
      "name": "Delete Game",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:3000/api/games/{{gameId}}"
      }
    }
  ],
  "variable": [
    {
      "key": "gameId",
      "value": ""
    }
  ]
}
