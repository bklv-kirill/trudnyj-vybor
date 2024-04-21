<?php

namespace App\Console\Commands\RabbitMQ;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;

class Listen extends Command
{
    protected $signature = 'rabbitmq:listen {queue}';

    protected $description = 'Command description';

    public function handle(): void
    {
        $connection = new AMQPStreamConnection(config('rabbitmq.host'), config('rabbitmq.port'), config('rabbitmq.user'), config('rabbitmq.pass'), config('rabbitmq.vhost'));
        $channel = $connection->channel();

        echo " [*] Waiting for messages. To exit press CTRL+C\n";

        $callback = function ($msg) {
            echo ' [x] Received ', $msg->body, "\n";
        };

        $channel->basic_consume($this->argument('queue'), '', false, true, false, false, $callback);

        try {
            $channel->consume();
        } catch (\Throwable $exception) {
            echo $exception->getMessage();
        }
    }
}