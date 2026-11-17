import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { PlatformsService } from "./platforms.service.js";

@Controller('platforms')
export class PlatformsController {
    constructor(private readonly platformService: PlatformsService){}

    @Get()
    getAll() {return this.platformService.getAll()}

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {return this.platformService.getById(id)}

}