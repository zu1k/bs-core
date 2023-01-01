#!/bin/bash

CUR_DIR=$( cd $( dirname $0 ) && pwd )

project=book-searcher
targets=()
features=()

ALL_TARGETS="
i686-unknown-linux-musl
x86_64-pc-windows-gnu
x86_64-unknown-linux-gnu
x86_64-unknown-linux-musl
armv7-unknown-linux-musleabihf
armv7-unknown-linux-gnueabihf
arm-unknown-linux-gnueabi
arm-unknown-linux-gnueabihf
arm-unknown-linux-musleabi
arm-unknown-linux-musleabihf
aarch64-unknown-linux-gnu
aarch64-unknown-linux-musl
"

while getopts "p:t:a:f" opt; do
    case $opt in
        p)
            project=($OPTARG)
            ;;
        t)
            targets+=($OPTARG)
            ;;
        a)
            targets+=($ALL_TARGETS)
            ;;
        f)
            features+=($OPTARG)
            ;;
        ?)
            echo "Usage: $(basename $0) [-t <target-triple>] [-f features]"
            ;;
    esac
done

features+=${EXTRA_FEATURES}

if [[ "${#targets[@]}" == "0" ]]; then
    echo "Specifying compile target with -t <target-triple>"
    exit 1
fi

function build() {
    cd "$CUR_DIR/.."

    TARGET=$1

    RELEASE_DIR="target/${TARGET}/release"
    TARGET_FEATURES="${features[@]}"

    if [[ "${TARGET_FEATURES}" != "" ]]; then
        echo "* Building ${project} package for ${TARGET} with features \"${TARGET_FEATURES}\" ..."

        cross build --target "${TARGET}" \
                    --default-features=false
                    --features "${TARGET_FEATURES}" \
                    -p book-searcher \
                    --release
    else
        echo "* Building ${project} package for ${TARGET} ..."

        cross build --target "${TARGET}" \
                    -p book-searcher \
                    --release
    fi

    if [[ $? != "0" ]]; then
        exit 1
    fi

    PKG_DIR="${CUR_DIR}/../release"
    mkdir -p "${PKG_DIR}"

    if [[ "$TARGET" == *"-windows-"* ]]; then
        PKG_NAME="${project}-${TARGET}.zip"
        PKG_PATH="${PKG_DIR}/${PKG_NAME}"

        echo "* Packaging ZIP in ${PKG_PATH} ..."
        cd ${RELEASE_DIR}
        zip ${PKG_PATH} ${project}.exe

        if [[ $? != "0" ]]; then
            exit 1
        fi

        cd "${PKG_DIR}"
        shasum -a 256 "${PKG_NAME}" > "${PKG_NAME}.sha256"
    else
        PKG_NAME="${project}-${TARGET}.tar.gz"
        PKG_PATH="${PKG_DIR}/${PKG_NAME}"

        cd ${RELEASE_DIR}

        echo "* Packaging gz in ${PKG_PATH} ..."
        tar -czf ${PKG_PATH} ${project}

        if [[ $? != "0" ]]; then
            exit 1
        fi

        cd "${PKG_DIR}"
        shasum -a 256 "${PKG_NAME}" > "${PKG_NAME}.sha256"
    fi

    echo "* Done build package ${PKG_NAME}"
}

for target in "${targets[@]}"; do
    cargo clean;
    build "$target";
done
