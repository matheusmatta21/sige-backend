import { Controller, Get } from "@nestjs/common";
import { PublishersService } from "./publishers.service.js";

@Controller('publishers')

export class PublishersController {
    constructor(private publishersService: PublishersService){}

    @Get()
    getAll() {
        return this.publishersService.getAll()
    }
}