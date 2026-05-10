import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Race War API',
      version: '1.0.0',
      description:
        'API para o aplicativo Race War — rastreamento de atividades urbanas (corrida, bike, skate), territórios e ranking.',
    },
    servers: [{ url: '/api', description: 'API principal' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ─── Auth ────────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'nickname', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'João Silva' },
            nickname: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_]+$',
              minLength: 3,
              maxLength: 30,
              example: 'joao_silva',
            },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            password: { type: 'string', minLength: 6, example: 'senha123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            password: { type: 'string', example: 'senha123' },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        // ─── User ────────────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Silva' },
            nickname: { type: 'string', example: 'joao_silva' },
            email: { type: 'string', format: 'email' },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'João Silva' },
            nickname: { type: 'string', example: 'joao_silva' },
            avatarUrl: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          },
        },
        FriendRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            senderId: { type: 'string', format: 'uuid' },
            receiverId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
            createdAt: { type: 'string', format: 'date-time' },
            sender: { $ref: '#/components/schemas/User' },
            receiver: { $ref: '#/components/schemas/User' },
          },
        },
        // ─── Activity ────────────────────────────────────────────────────────────
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            mode: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time', nullable: true },
            durationSec: { type: 'integer', nullable: true },
            route: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                },
              },
              nullable: true,
            },
          },
        },
        StartActivityRequest: {
          type: 'object',
          required: ['mode'],
          properties: {
            mode: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'], example: 'RACE' },
          },
        },
        FinishActivityRequest: {
          type: 'object',
          required: ['route', 'durationSec'],
          properties: {
            route: {
              type: 'array',
              minItems: 2,
              items: {
                type: 'object',
                required: ['lat', 'lng'],
                properties: {
                  lat: { type: 'number', example: -23.5505 },
                  lng: { type: 'number', example: -46.6333 },
                },
              },
            },
            durationSec: { type: 'integer', minimum: 1, example: 1800 },
            polygon: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                },
              },
            },
          },
        },
        // ─── Territory ───────────────────────────────────────────────────────────
        Territory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            mode: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] },
            polygon: { type: 'object', description: 'GeoJSON polygon' },
            createdAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        TerritoryStats: {
          type: 'object',
          properties: {
            totalTerritories: { type: 'integer' },
            totalAreaKm2: { type: 'number' },
            byMode: {
              type: 'object',
              properties: {
                RACE: { type: 'integer' },
                BIKE: { type: 'integer' },
                SKATE: { type: 'integer' },
              },
            },
          },
        },
        // ─── Challenge ───────────────────────────────────────────────────────────
        Challenge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'EXPIRED'] },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        // ─── Leaderboard ─────────────────────────────────────────────────────────
        LeaderboardEntry: {
          type: 'object',
          properties: {
            rank: { type: 'integer' },
            user: { $ref: '#/components/schemas/User' },
            score: { type: 'number' },
            totalActivities: { type: 'integer' },
            totalDistanceKm: { type: 'number' },
          },
        },
        // ─── Shared ──────────────────────────────────────────────────────────────
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro' },
          },
        },
      },
    },
    paths: {
      // ─── Health ──────────────────────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Verificar status da API',
          servers: [{ url: '/' }],
          responses: {
            200: {
              description: 'API online',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ─── Auth ────────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
            },
          },
          responses: {
            201: {
              description: 'Usuário registrado com sucesso',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
            400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Email ou nickname já em uso', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autenticar usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
            },
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
            401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Renovar access token',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } },
            },
          },
          responses: {
            200: {
              description: 'Token renovado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'Token inválido ou expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Encerrar sessão',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } },
            },
          },
          responses: {
            200: { description: 'Logout realizado' },
            401: { description: 'Token inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Users ───────────────────────────────────────────────────────────────
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Obter perfil do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Perfil do usuário',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Atualizar perfil do usuário autenticado',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } },
            },
          },
          responses: {
            200: {
              description: 'Perfil atualizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/search': {
        get: {
          tags: ['Users'],
          summary: 'Buscar usuários por nickname',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string', minLength: 1, maxLength: 50 },
              description: 'Texto para busca no nickname',
            },
          ],
          responses: {
            200: {
              description: 'Lista de usuários encontrados',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
              },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/friends': {
        get: {
          tags: ['Users'],
          summary: 'Listar amigos do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de amigos',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
              },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/friends/pending': {
        get: {
          tags: ['Users'],
          summary: 'Listar solicitações de amizade pendentes',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de solicitações pendentes',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/FriendRequest' } },
                },
              },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/friends/{id}': {
        post: {
          tags: ['Users'],
          summary: 'Enviar solicitação de amizade',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID do usuário a ser adicionado',
            },
          ],
          responses: {
            201: {
              description: 'Solicitação enviada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/FriendRequest' } } },
            },
            400: { description: 'Solicitação inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Usuário não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/friends/requests/{requestId}/accept': {
        patch: {
          tags: ['Users'],
          summary: 'Aceitar solicitação de amizade',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'requestId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da solicitação de amizade',
            },
          ],
          responses: {
            200: {
              description: 'Solicitação aceita',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/FriendRequest' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Solicitação não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Obter usuário por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID do usuário',
            },
          ],
          responses: {
            200: {
              description: 'Dados do usuário',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Usuário não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Activities ──────────────────────────────────────────────────────────
      '/activities': {
        post: {
          tags: ['Activities'],
          summary: 'Iniciar nova atividade',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/StartActivityRequest' } },
            },
          },
          responses: {
            201: {
              description: 'Atividade iniciada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Activity' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        get: {
          tags: ['Activities'],
          summary: 'Listar atividades do usuário autenticado',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'mode',
              in: 'query',
              schema: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] },
              description: 'Filtrar por modalidade',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
            },
          ],
          responses: {
            200: {
              description: 'Lista de atividades paginada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/activities/{id}/finish': {
        patch: {
          tags: ['Activities'],
          summary: 'Finalizar atividade em andamento',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da atividade',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FinishActivityRequest' } },
            },
          },
          responses: {
            200: {
              description: 'Atividade finalizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Activity' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Atividade não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/activities/{id}': {
        get: {
          tags: ['Activities'],
          summary: 'Obter atividade por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da atividade',
            },
          ],
          responses: {
            200: {
              description: 'Dados da atividade',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Activity' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Atividade não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Activities'],
          summary: 'Remover atividade',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da atividade',
            },
          ],
          responses: {
            204: { description: 'Atividade removida' },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Sem permissão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Atividade não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Territories ─────────────────────────────────────────────────────────
      '/territories': {
        get: {
          tags: ['Territories'],
          summary: 'Listar territórios com filtros geográficos',
          parameters: [
            { name: 'mode', in: 'query', schema: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] } },
            { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrar por dono' },
            { name: 'lat', in: 'query', schema: { type: 'number' }, description: 'Latitude do centro de busca' },
            { name: 'lng', in: 'query', schema: { type: 'number' }, description: 'Longitude do centro de busca' },
            {
              name: 'radiusKm',
              in: 'query',
              schema: { type: 'number', minimum: 1, maximum: 100, default: 10 },
              description: 'Raio de busca em km',
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
          ],
          responses: {
            200: {
              description: 'Lista de territórios paginada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Territory' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/territories/my/stats': {
        get: {
          tags: ['Territories'],
          summary: 'Estatísticas de territórios do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Estatísticas de território',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/TerritoryStats' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/territories/user/{userId}/stats': {
        get: {
          tags: ['Territories'],
          summary: 'Estatísticas de territórios de um usuário específico',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID do usuário',
            },
          ],
          responses: {
            200: {
              description: 'Estatísticas de território',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/TerritoryStats' } } },
            },
            404: { description: 'Usuário não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/territories/{id}': {
        get: {
          tags: ['Territories'],
          summary: 'Obter território por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID do território',
            },
          ],
          responses: {
            200: {
              description: 'Dados do território',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Territory' } } },
            },
            404: { description: 'Território não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Challenges ──────────────────────────────────────────────────────────
      '/challenges': {
        get: {
          tags: ['Challenges'],
          summary: 'Listar desafios do usuário autenticado',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'EXPIRED'] },
              description: 'Filtrar por status',
            },
          ],
          responses: {
            200: {
              description: 'Lista de desafios',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                },
              },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Leaderboard ─────────────────────────────────────────────────────────
      '/leaderboard': {
        get: {
          tags: ['Leaderboard'],
          summary: 'Ranking global',
          parameters: [
            { name: 'mode', in: 'query', schema: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] }, description: 'Filtrar por modalidade' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
          ],
          responses: {
            200: {
              description: 'Ranking global',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/LeaderboardEntry' } },
                },
              },
            },
          },
        },
      },
      // ─── Notifications ───────────────────────────────────────────────────────
      '/notifications/vapid-public-key': {
        get: {
          tags: ['Notifications'],
          summary: 'Obter chave pública VAPID para Web Push',
          responses: {
            200: {
              description: 'Chave pública VAPID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { publicKey: { type: 'string', nullable: true } },
                  },
                },
              },
            },
          },
        },
      },
      '/notifications/push/subscribe': {
        post: {
          tags: ['Notifications'],
          summary: 'Registrar subscription para receber push notifications',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['endpoint', 'keys'],
                  properties: {
                    endpoint: {
                      type: 'string',
                      format: 'uri',
                      example: 'https://fcm.googleapis.com/fcm/send/...',
                    },
                    keys: {
                      type: 'object',
                      required: ['p256dh', 'auth'],
                      properties: {
                        p256dh: { type: 'string', example: 'BNcRdreALRFXTkOOUHK1...' },
                        auth: { type: 'string', example: 'tBHItJI5svbpez7KI4CCXg==' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Subscription registrada com sucesso' },
            400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Remover subscription de push notifications',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['endpoint'],
                  properties: {
                    endpoint: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
          responses: {
            204: { description: 'Subscription removida' },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      // ─── Leaderboard ─────────────────────────────────────────────────────────
      '/leaderboard/me': {
        get: {
          tags: ['Leaderboard'],
          summary: 'Posição do usuário autenticado no ranking',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'mode', in: 'query', schema: { type: 'string', enum: ['RACE', 'BIKE', 'SKATE'] } },
          ],
          responses: {
            200: {
              description: 'Posição no ranking',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaderboardEntry' } } },
            },
            401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export default swaggerOptions;
