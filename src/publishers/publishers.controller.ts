import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { PublishersService } from "./publishers.service.js";

@Controller('publishers')

export class PublishersController {
    constructor(private publishersService: PublishersService){}

    @Get()
    getAll() {return this.publishersService.getAll()}

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {return this.publishersService.getById(id)}
}