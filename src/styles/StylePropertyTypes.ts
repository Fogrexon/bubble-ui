export type StrictStyleProperty = {
    font: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;

    color: string;
    textAlign: string;

    backgroundColor: string;
    border: string;
    borderRadius: string;
    borderColor: string;
    borderWidth: string;

    padding: string;
    margin: string;
    width: string;
    height: string;

    display: string;
    position: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
    flexWrap: string;
}

export type StyleProperty = Partial<StrictStyleProperty>