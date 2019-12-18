const spawn_ffmpeg = {
    path: require('path'),
    fs: require('fs'),
    spawn: require('child_process').spawn,

    merge: async (input, output) => {
        let args = [
            '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', input,
            '-c', 'copy',
            '-vcodec', 'libvpx',
            '-acodec', 'libvorbis',
            output
        ]

        let path_ffmpeg = spawn_ffmpeg.path.join(__dirname, "../lib/ffmpeg.exe");

        spawn_ffmpeg.proc = await spawn_ffmpeg.spawn(path_ffmpeg, args);

        await spawn_ffmpeg.proc.on('close', function (code) {
            console.log(`child process exited with code ${code}`);
            return true;
        });

        await spawn_ffmpeg.proc.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
          
        await spawn_ffmpeg.proc.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        await spawn_ffmpeg.proc.on('error', err => {
            return false;
        });
    }
}

module.exports = spawn_ffmpeg;