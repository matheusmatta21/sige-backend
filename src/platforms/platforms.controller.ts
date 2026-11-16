import { Controller, Get } from "@nestjs/common";
import { PlatformsService } from "./platforms.service.js";

@Controller('platforms')
export class PlatformsController {
    constructor(private readonly platformService: PlatformsService){}

    @Get()
    findAll() {
        return this.platformService.getAll()
    }
}