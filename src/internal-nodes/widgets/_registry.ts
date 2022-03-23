import { ButtonWidget } from "./button-widget";
import { ConsoleWidget } from "./console-widget";
import { ListGetWidget } from "./data/items-widget";
import { ListSetWidget } from "./data/list-widget";
import { FileLoadWidget } from "./file-load-widget";
import { FileSaveWidget } from "./file-save-widget";
import { ImageWidget } from "./image-widget";
import { InputWidget } from "./input-widget";
import { LampWidget } from "./lamp-widget";
import { InspectWidget } from "./inspect-widget";
import { SliderWidget } from "./slider-widget";
import { ViewWidget } from "./view-widget";
import { GetterWidget } from "./data/getter-widget";
import { SetterWidget } from "./data/setter-widget";

export function getDefaultWidgets() {
    return [
        ButtonWidget.new(false),
        InputWidget.new("hello world"),
        SliderWidget.new(5),
        LampWidget.new(false),
        ConsoleWidget.new(false),
        ImageWidget.new("<image>"),
        ViewWidget.new(false),
        FileSaveWidget.new(false),
        FileLoadWidget.new(false),
        InspectWidget.new({}),
        ListGetWidget.new(3),
        ListSetWidget.new(3),
        GetterWidget.new(undefined),
        SetterWidget.new(3),
    ]
}