import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { People, Planets, Films, SearchResponse } from "./types";
import { error } from "console";

// Para exemplo simples, não está em variável de ambiente
// Caso for utilizar em projeto real de produção, lembre-se de guardar.
const BASE_URL = "https://swapi.dev/api";

class SimpleMcpServer {
    private server: McpServer;
    private axiosInstance;

    constructor() {
        this.server = new McpServer({
            name: "simple-mcp-server",
            version: "1.0.0"
        });

        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            timeout: 10000
        });

        this.setupTools();
        this.setupResources();
    }

    private setupTools(): void {
        this.server.registerTool(
            "search_characters",
            {
                title: "Search characters Star Wars",
                description: "Search characters Star Wars, in API by name",
                inputSchema: {
                    search: z.string().describe("Name os an caracters os Star Wars Films"),
                },
            },
            async ({ search }) => {
                try {
                    const response = await this.axiosInstance.get("/people/", {
                        params: { search },
                    }) as { data: SearchResponse<People> };

                if (response.data.results.length === 0) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `No match found to ${search}`,
                            },
                        ],
                    };
                }
                const charactersInfo = response.data.results
                    .map((char) => {
                        return `Name: ${char.name}, Height: ${char.height}, Mass: ${char.mass}, Birth Year: ${char.birth_year}, Gender: ${char.gender}, Eye Color: ${char.eye_color}, Hair Color: ${char.hair_color}, Skin Color: ${char.skin_color}`;
                    })
                    .join("\n~~~~\n\n");
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Found ${response.data.results.length} characters:\n\n${charactersInfo}`,
                        }
                    ]
                };
            } catch (error) {
                return this.handleError(error, "Characters search");
            }
        }
        );
        this.server.registerTool(
            "search_planets",
            {
                title: "Search planets Star Wars",
                description: "Search planets Star Wars, in API by name",
                inputSchema: {
                    search: z.string().describe("Name of a planet in Star Wars Films"),
                },
            },
            async ({ search }) => {
                try {
                    const response = await this.axiosInstance.get("/planets/", {
                        params: { search },
                    }) as { data: SearchResponse<Planets> };

                if (response.data.results.length === 0) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `No match found to ${search}`,
                            },
                        ],
                    };
                }
                const planetsInfo = response.data.results
                    .map((planet) => {
                        return `Name: ${planet.name}, Diameter: ${planet.diameter}, Population: ${planet.population}, Climate: ${planet.climate}, Terrain: ${planet.terrain}, Gravity: ${planet.gravity}`;
                    })
                    .join("\n~~~~\n\n");
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Found ${response.data.results.length} planets:\n\n${planetsInfo}`,
                        }
                    ]
                };
            } catch (error) {
                return this.handleError(error, "Planets search");
            }
        }
        );
        this.server.registerTool(
            "search_films",
            {
                title: "Search films Star Wars",
                description: "Search films Star Wars, in API by title",
                inputSchema: {
                    search: z.string().describe("Title of a Star Wars film"),
                },
            },
            async ({ search }) => {
                try {
                    const response = await this.axiosInstance.get("/films/", {
                        params: { search },
                    }) as { data: SearchResponse<Films> };

                if (response.data.results.length === 0) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `No match found to ${search}`,
                            },
                        ],
                    };
                }
                const filmsInfo = response.data.results
                    .map((film) => {
                        return `Title: ${film.title}, Episode: ${film.episode_id}, Director: ${film.director}, Producer: ${film.producer}, Release Date: ${film.release_date}`;
                    })
                    .join("\n~~~~\n\n");
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Found ${response.data.results.length} films:\n\n${filmsInfo}`,
                        }
                    ]
                };
            } catch (error) {
                return this.handleError(error, "Films search");
            }
        }
        );
    }

    private setupResources(): void {
        // TODO: Implement resources
    }

    private handleError(error: any, operation: string) {
        console.error(`Error in ${operation}:`, error);
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error occurred during ${operation}: ${error.message || 'Unknown error'}`,
                }
            ]
        };
    }

    async run(): Promise<void> {
        const transport = new StdioClientTransport({
            command: "node",
            args: [process.argv[1]]
        });
        await this.server.connect(transport);
        console.log("connected to the server");
    }
}

const server = new SimpleMcpServer();
server.run().catch(error => {
    console.log("Erro to start the MCP Server", error);
    process.exit(1);
});

