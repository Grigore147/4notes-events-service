import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

type HealthCheckResponse = {
    status: string;
};

// type MetricsResponse = {
//     status: string;
//     metrics: {
//         uptime: number;
//         memoryUsage: number;
//     };
// };

@Controller('health')
export class HealthController {
    @Get()
    healthCheck(): HealthCheckResponse {
        return { status: 'ok' };
    }

    @Get('metrics')
    metrics(@Res() response: Response): Response {
        return response.status(HttpStatus.OK).json({
            status: 'ok',
            metrics: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            }
        });
    }
}
