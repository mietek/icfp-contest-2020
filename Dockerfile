# This file is a copy of the official [contest dockerfiles](https://github.com/icfpcontest2020/dockerfiles/blob/master/dockerfiles/python/Dockerfile).
# The dockerfile is replaced by the build system anyway, so any changes here wouldn't be reflected on the submission environment.
# We can use it to debug build issues, though.
FROM icfpcontest2020/python

WORKDIR /solution
COPY . .
RUN chmod +x ./build.sh
RUN chmod +x ./run.sh
RUN ./build.sh
ENTRYPOINT ["./run.sh"]
